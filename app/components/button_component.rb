# frozen_string_literal: true

class ButtonComponent < ViewComponent::Base
  def initialize(name:, label:, type:, icon: nil, href: nil)
    @name = name
    @label = label
    @type = type
    @icon = icon
    @href = href
  end

  def pick_color
    # TODO: Add more colors
    case @type
    when 'submit'
      'bg-blue-500 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white'
    when 'success'
      'bg-green-500 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white'
    end
  end
end
