class UserMailer < ApplicationMailer
    def confirmation_email
        mail(to: params[:email], subject: "VolunteerMap | Confirm your e-mail address")
    end

    def email_update
        mail(to: params[:email], subject: "VolunteerMap | Confirm to update your e-mail address")
    end
end
