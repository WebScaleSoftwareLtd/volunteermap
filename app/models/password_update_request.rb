class PasswordUpdateRequest < ApplicationRecord
    include UserTokenConcern

    after_create :send_email

    private

    def send_email
        UserMailer.with(token: self.token, username: self.user.username).password_update.deliver_later
    end
end
