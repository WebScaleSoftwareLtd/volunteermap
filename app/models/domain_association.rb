class DomainAssociation < ApplicationRecord
    belongs_to :user

    validates :domain, presence: true, uniqueness: { scope: :user_id }
    before_validation :lowercase_domain!
    validate :check_domain_is_valid!
    after_create :start_validation_job

    has_many :opportunities

    def is_valid?
        DomainUtil.recursive_dns_validation domain.split("."), [
            {
                "type" => "TXT",
                "value" => "volunteermap_user_validation=#{user.user_validation_id}"
            }
        ]
    end

    def validation_check!
        if is_valid?
            # Zero out the validation check count.
            self.validation_check_count = 0
            update_columns(validation_active: true, validation_check_count: 0)

            # Return true.
            return true
        end

        # If the valdiation check count is 4, this will be the fifth check.
        # Class it as dead and return false.
        if validation_check_count == 4
            self.validation_active = false
            self.validation_check_count = 0
            update_columns(validation_active: false, validation_check_count: 0)

            return false
        end

        # Add 1 to the count and return true.
        self.validation_check_count += 1
        update_columns(validation_check_count: validation_check_count)
        true
    end

    private

    def lowercase_domain!
        self.domain = domain.downcase
    end

    def check_domain_is_valid!
        unless is_valid?
            errors.add :domain, "does not have the specified TXT record added"
        end
    end

    def start_validation_job
        DomainValidationJob.set(wait: 1.hour).perform_later id
    end
end
