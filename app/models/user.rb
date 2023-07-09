class User < ApplicationRecord
    include AlgoliaSearch

    has_one_attached :avatar do |attachable|
        attachable.variant :thumb, resize_to_limit: [256, 256]
    end
    validates :avatar, file_size: { less_than_or_equal_to: 3.megabytes },
        file_content_type: { allow: ['image/jpeg', 'image/png'] }

    has_many :domain_associations, dependent: :destroy
    has_many :opportunities, dependent: :destroy
    has_many :user_tokens, dependent: :destroy
    has_many :half_tokens, dependent: :destroy
    has_many :user_backup_codes, dependent: :destroy
    has_many :bookmarks, dependent: :destroy
    has_one :email_update_request, dependent: :destroy

    has_secure_password
    validates :username, presence: true, uniqueness: { case_sensitive: false },
        format: { with: /\A[a-zA-Z0-9]+\Z/, message: "can only contain letters and numbers" },
        length: { minimum: 3, maximum: 20 }
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

    def generate_backup_codes
        UserBackupCode.transaction do
            user_backup_codes.destroy_all
            codes = 10.times.map { "#{rand_adj} #{rand_noun} #{rand_adj} #{rand_noun} #{rand_adj} #{rand_noun}" }
            codes.each do |code|
                UserBackupCode.create!(user: self, backup_code: code)
            end
            codes
        end
    end

    def avatar_url
        return avatar.url if avatar.attached?
        '/default-pfp.png'
    end

    private

    def rand_adj
        Spicy::Proton.adjective
    end

    def rand_noun
        Spicy::Proton.noun
    end

    def create_user_validation_id!
        if user_validation_id.nil?
            self.user_validation_id = SecureRandom.uuid
        end
    end

    def destroy_pending_signups
        PendingSignup.where(email: email).destroy_all
    end
end
