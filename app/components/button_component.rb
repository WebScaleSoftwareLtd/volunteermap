# frozen_string_literal: true

class ButtonComponent < ViewComponent::Base
  def initialize(name:, label:, type:)
    @name = name
    @label = label
    @type = type
  end

  def pick_color
    # TODO: Add more colors
    case @type
    when 'submit'
      'bg-blue-500 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white'
    end
  end
end
