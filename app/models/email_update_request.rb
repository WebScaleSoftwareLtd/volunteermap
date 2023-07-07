class EmailUpdateRequest < ApplicationRecord
    belongs_to :user
    validates :email, presence: true, uniqueness: true
    validates :user_id, presence: true, uniqueness: true
    validates :token, presence: true, uniqueness: true
    validate :email_is_not_taken_by_another_user

    before_validation :generate_token, on: :create
    before_validation :lowercase_email, on: :create

    after_create :send_email

    private

    def generate_token
        self.token = SecureRandom.hex(20)
    end

    def lowercase_email
        self.email = email.downcase
    end

    def email_is_not_taken_by_another_user
        return unless User.exists?(email: email)

        errors.add :email, "is already taken by a user"
    end

    def send_email
        UserMailer.with(token: self.token, email: self.email, username: user.username).email_update.deliver_later
    end
end
