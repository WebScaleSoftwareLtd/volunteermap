class UserMailer < ApplicationMailer
    def confirmation_email
        @token = params[:token]
        mail(to: params[:email], subject: "VolunteerMap | Confirm your e-mail address")
    end
end
