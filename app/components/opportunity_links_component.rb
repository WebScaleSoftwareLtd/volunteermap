# frozen_string_literal: true

class OpportunityLinksComponent < ViewComponent::Base
  def initialize(value:, owned:)
    @value = value
    @owned = owned
  end
end
