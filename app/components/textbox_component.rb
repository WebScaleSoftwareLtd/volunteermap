# frozen_string_literal: true

class TextboxComponent < ViewComponent::Base
  def initialize(form:, name:, label:, value: nil, type: nil, slim: nil)
    @form = form
    @name = name
    @label = label
    @value = value || ''
    @type = type || 'text'
    @slim = slim
  end
end
