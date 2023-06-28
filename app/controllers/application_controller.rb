class ApplicationController < ActionController::Base
    before_action :handle_token

    private

    def handle_token
        auth_cookie = cookies.signed[:auth]
        if auth_cookie.present?
            # Get the user token.
            token = UserToken.find_by(token: auth_cookie)

            # Drop the cookie if the token no longer exists.
            return cookie.delete(:auth) unless token.present?

            # Drop the cookie and token if it is expired.
            if token.updated_at < 3.days.ago
                token.destroy
                cookie.delete(:auth)
                return
            end

            # Touch the token.
            token.touch

            # Update the cookie.
            cookies.signed[:auth] = { value: token.token, expires: 3.days.from_now }

            # Set the current user.
            @user = token.user
        end
    end
end