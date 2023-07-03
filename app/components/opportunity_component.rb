# frozen_string_literal: true

class OpportunityComponent < ViewComponent::Base
  def initialize(value:, owned:)
    @value = value
    @owned = owned
  end
end
