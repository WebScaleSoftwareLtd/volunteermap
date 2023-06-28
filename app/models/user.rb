class User < ApplicationRecord
    include AlgoliaSearch

    has_many :domain_associations, dependent: :destroy
    has_many :opportunities, dependent: :destroy
    has_many :user_tokens, dependent: :destroy
    has_many :half_tokens, dependent: :destroy
    has_many :user_backup_codes, dependent: :destroy

    has_secure_password
    validates :username, presence: true, uniqueness: { case_sensitive: false }
    validates :email, uniqueness: true, presence: true,
        format: {
            with: URI::MailTo::EMAIL_REGEXP,
            message: "must be a valid email address"
        }

    before_validation :create_user_validation_id!
    validates :user_validation_id, presence: true, uniqueness: true
    after_create :destroy_pending_signups

    algoliasearch do
        attribute :username
    end

    def logout
        user_tokens.destroy_all
        half_tokens.destroy_all
    end

    private

    def create_user_validation_id!
        if user_validation_id.nil?
            self.user_validation_id = SecureRandom.uuid
        end
    end

    def destroy_pending_signups
        PendingSignup.where(email: email).destroy_all
    end
end
