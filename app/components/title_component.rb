# frozen_string_literal: true

class TitleComponent < ViewComponent::Base
  def initialize(title:, subtitle:, long: false)
    @title = title
    @subtitle = subtitle
    @long = long    
  end
end
