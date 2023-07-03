# frozen_string_literal: true

class TitleComponent < ViewComponent::Base
  def initialize(title:, subtitle:, long: false, side: nil)
    @title = title
    @subtitle = subtitle
    @long = long
    @side = side
  end
end
