# frozen_string_literal: true

class TextareaComponent < ViewComponent::Base
    def initialize(form:, name:, label: nil, value: nil, type: nil, slim: nil, description: nil, required: false)
      @form = form
      @name = name
      @label = label
      @value = value || ''
      @type = type || 'text'
      @slim = slim
      @description = description
      @required = required
    end
  end
  