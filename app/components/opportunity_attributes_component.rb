# frozen_string_literal: true

class OpportunityAttributesComponent < ViewComponent::Base
  def initialize(value:)
    @value = value
  end

  def select_color(key)
    return 'text-green-700 dark:text-green-300' if @value[key] == true

    'text-red-700 dark:text-red-300'
  end
end
