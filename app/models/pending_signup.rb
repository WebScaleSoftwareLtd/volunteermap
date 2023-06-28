class PendingSignup < ApplicationRecord
    validates :email, presence: true, format: {
        with: URI::MailTo::EMAIL_REGEXP,
        message: "must be a valid email address"
    }
    before_validation :downcase_email!
    before_validation :email_token_generate!
    validate :email_is_not_already_a_user
    after_create :send_confirmation_email

    def self.find_by_email_token!(email_token)
        x = PendingSignup.find_by!(email_token: email_token)
        return if User.exists?(email: x.email)
        x
    end

    private

    def downcase_email!
        self.email = email.downcase
    end

    def email_token_generate!
        if email_token.nil?
            self.email_token = SecureRandom.uuid
        end
    end

    def email_is_not_already_a_user
        if User.exists?(email: email)
            errors.add(:email, "is already taken by a user")
        end
    end

    def send_confirmation_email
        UserMailer.with(email: email, token: email_token).confirmation_email.deliver_later
    end
end
