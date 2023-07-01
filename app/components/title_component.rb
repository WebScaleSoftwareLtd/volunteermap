# frozen_string_literal: true

class TitleComponent < ViewComponent::Base
  def initialize(title:, subtitle:)
    @title = title
    @subtitle = subtitle
  end
end
