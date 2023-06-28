require "net/dns"
require "dnsruby"

class OnlyValue
  def initialize(v)
    @v = v
  end

  def value
    @v
  end
end

class DomainUtil
  # Be careful with this function since it will not be the most up to date. For a nameservers A record, this is fine,
  # but for other records, this may not be the most up to date.
  def self.cached_non_recursive_dns_get(domain, cache)
    # Check if the domain is an IPv4 or IPv6 address.
    if domain =~ /^([0-9]+\.){3}[0-9]+$/ || domain =~ /^([0-9a-f]+:)+[0-9a-f]+$/i
      # Return the domain as an array.
      return [OnlyValue.new(domain)]
    end

    # Check the cache.
    cache_key = "A_" + domain
    cache_result = cache[cache_key]
    return cache_result unless cache_result.nil?

    # Get the A record.
    res = Net::DNS::Resolver.new
    answers = res.query(domain, Net::DNS::A).answer
    answers = [] if answers.nil?
    cache[cache_key] = answers
    answers
  end

  def self.must_pluck_first(arr)
    # Make sure the array is not empty.
    return nil if arr.empty?

    # Return the first element.
    arr[0].value
  end

  def self.cached_dns_type_get(type, domain, cache)
    # Check the cache.
    cache_key = type + "_" + domain.join(".")
    cache_result = cache[cache_key]
    return cache_result unless cache_result.nil?

    # Recurse through the name servers to find the correct name server.
    last_ns = DomainUtil.must_pluck_first(cached_non_recursive_dns_get("a.root-servers.net", cache))
    rev = domain.reverse
    parts = ""
    rev.each do |d|
      parts = d + "." + parts

      # Get the name servers.
      res = Net::DNS::Resolver.new
      res.nameservers = [last_ns]
      res.retry_number = 1
      res.tcp_timeout = 3
      res.udp_timeout = 3
      x = res
        .query(parts, Net::DNS::NS)
      (x.answer + x.authority)
        .each do |ns|
          # Get the name server.
          last_ns = DomainUtil.must_pluck_first(DomainUtil.cached_non_recursive_dns_get(ns.value.split(' ').first, cache))
          break
        end
    end

    # Ask the nearest nameserver for the records.
    res = Dnsruby::Resolver.new({:nameserver => [last_ns], :query_timeout => 3})
    begin
      res = res.query(domain.join("."), type)
      answers = res.answer
      answers = [] if answers.nil?
      cache[cache_key] = answers
      answers
    rescue Dnsruby::NXDomain
      cache[cache_key] = []
      []
    end
  end

  # Validates all the records of the domain recursively. Returns a boolean
  # suggesting if all the records are present.
  def self.recursive_dns_validation(domain_split, records)
    cache = {}
    records.each do |record|
      # Get the name and type of the record.
      type = record["type"].upcase
      s = domain_split.dup
      name = record["name"]
      unless name.nil? || name.empty?
        name_split = name.split(".")
        name_split.filter! { |x| !x.empty? }
        s = name_split + s
      end

      # Get the DNS records for the type.
      inner_records = DomainUtil.cached_dns_type_get(type, s, cache)
      record = record.dup
      record.delete("name")

      # Go through the records and see if any match.
      matched = false
      inner_records.each do |possible_record|
        # Check if it matches.
        didnt_match = false
        possible_record_s = possible_record.to_s
        record.each do |k, v|
          # Check if the record matches.
          unless possible_record_s.include? v.to_s
            didnt_match = true
            break
          end
        end

        # If we matched, set matched to true and break.
        unless didnt_match
          matched = true
          break
        end
      end

      # If we didn't match, return false.
      return false unless matched
    end

    # We matched. Return true here.
    true
  end
end
