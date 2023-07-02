# frozen_string_literal: true

class SelectComponent < ViewComponent::Base
  def initialize(options:, name:, required: false, default: nil, label: nil, description: nil)
    @options = options
    @name = name
    @required = required
    @default = default
    @label = label
    @description = description
  end
end
