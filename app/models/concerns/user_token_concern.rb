module UserTokenConcern
    extend ActiveSupport::Concern

    included do
        belongs_to :user

        validates :token, presence: true, uniqueness: true
        before_validation :generate_token!
    end

    private

    def generate_token!
        if token.nil?
            self.token = SecureRandom.uuid
        end
    end
end
