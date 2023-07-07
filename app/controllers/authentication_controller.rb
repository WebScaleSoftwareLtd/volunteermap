class AuthenticationController < ApplicationController
    skip_before_action :handle_token, except: [:logout, :email_update]
    before_action :handle_preexisting_token, except: [:logout, :email_update]

    FAKE_HASH = BCrypt::Password.create('fake_hash')

    def login_form
        # Inject redirect_to into the params.
        if request.referer.nil?
            params[:redirect_to] = '/'
            return
        end
        path = URI.parse(request.referer).path
        params[:redirect_to] = path unless path == '/auth/login'
    end

    def login_password_post
        # Find the user by either their username or email.
        user = User.where('UPPER(username) = UPPER(?) OR email = ?', params[:username_or_email], params[:username_or_email].downcase).first

        # If the user doesn't exist, we should check against a fake bcrypt hash to prevent timing attacks.
        if user.nil?
            BCrypt::Password.new(FAKE_HASH) == params[:password]
            @invalid = true
            return render 'login_form'
        end

        # If the user exists, we should check their password.
        unless user.authenticate(params[:password])
            @invalid = true
            return render 'login_form'
        end

        # If the user has 2FA enabled, we should handle this.
        if user[:'2fa_token'].present?
            # Create a half token.
            half_token = HalfToken.create!(user: user)
            params[:token] = half_token.token

            # Render the 2fa form.
            return render 'login_2fa_form'
        end

        # Create a user token.
        user_token = UserToken.create!(user: user)
        cookies.signed[:auth] = { value: user_token.token, expires: 3.days.from_now }

        # Get the redirect to from the params.
        redirect = params[:redirect_to]
        redirect = '/' if redirect.nil?

        # Redirect to the redirect path.
        redirect_to redirect, status: :see_other
    end

    def login_2fa_post
        # Find the half token.
        half_token = HalfToken.find_by(token: params[:token])
        if half_token.nil?
            # Just re-render the form. We do not have enough information to tell the user what went wrong.
            return render 'login_form'
        end

        if half_token.updated_at < 2.hours.ago
            # The half token is expired.
            half_token.destroy
            return render 'login_form'
        end

        # Get the users 2fa token.
        user_2fa_token = half_token.user[:'2fa_token']
        if user_2fa_token.nil?
            # This means the user started this session before they removed their
            # 2FA token. Go ahead and log them in.
            user_token = UserToken.create!(user: half_token.user)
            cookies.signed[:auth] = { value: user_token.token, expires: 3.days.from_now }
            half_token.destroy

            # Get the redirect to from the params.
            redirect = params[:redirect_to]
            redirect = '/' if redirect.nil?
            return redirect_to redirect, status: :see_other
        end

        # Check the 2fa token.
        valid = ROTP::TOTP.new(user_2fa_token).verify(params[:'2fa_token'], drift_behind: 15)
        unless valid
            # Check the users backup codes.
            backup_code = half_token.user.user_backup_codes.where(backup_code: params[:'2fa_token']).first
            if backup_code.present?
                # We should destroy this code but set valid to true.
                backup_code.destroy
                valid = true
            end
        end

        # If this isn't valid, we should re-render the form.
        unless valid
            @invalid = true
            params[:token] = half_token.token
            return render 'login_2fa_form'
        end

        # Destroy this half token, make a user token, and set the cookie.
        half_token.destroy
        user_token = UserToken.create!(user: half_token.user)
        cookies.signed[:auth] = { value: user_token.token, expires: 3.days.from_now }

        # Get the redirect to from the params.
        redirect = params[:redirect_to]
        redirect = '/' if redirect.nil?

        # Redirect to the redirect path.
        redirect_to redirect, status: :see_other
    end

    def login_post
        params[:type] == '2fa' ? login_2fa_post : login_password_post
    end

    def logout
        @user.logout if @user.present?
        cookies.delete(:auth)
        redirect_to '/', status: :see_other
    end

    def register_enter_email_form
        # For GET requests, we should remove the redirect_to param.
        params.delete(:redirect_to)
    end

    def register_enter_email_post
        # Handle if this is a click through from the login page.
        return render 'register_enter_email_form' unless params[:email].present?

        # Create a pending signup.
        @pending_signup = PendingSignup.create(email: params[:email], redirect_to: params[:redirect_to])
        render 'register_enter_email_form'
    end

    def register_remainder_form
        @pending_signup = PendingSignup.find_by_email_token!(params[:email_token])
    end

    def register_remainder_post
        # Run the method above to get the sign-up.
        register_remainder_form

        # Inject the e-mail as a param.
        params[:email] = @pending_signup.email

        # Get all of the form items.
        form_items = params.permit(:email, :username, :password, :password_confirmation)

        # Submit the model.
        @result = User.new(form_items)
        if @result.save
            # A new user has been born! Go ahead and build a token for this.
            user_token = UserToken.create!(user: @result)
            cookies.signed[:auth] = { value: user_token.token, expires: 3.days.from_now }

            # Redirect where was initially wanted.
            redirect = @pending_signup.redirect_to
            redirect = '/' if redirect.nil?
            return redirect_to redirect, status: :see_other
        end

        # Re-render the form.
        render 'register_remainder_form'
    end

    def email_update
        # Get and delete the email update request from the token.
        email_update_request = EmailUpdateRequest.find_by!(token: params[:token])
        email_update_request.destroy

        # Update the users e-mail.
        res = email_update_request.user.update(email: email_update_request.email)
        redirect_to user ? '/user/settings' : '/', status: :see_other if res

        # Get the errors.
        @errors = email_update_request.user.errors.full_messages
    end

    # TODO: password resets

    private

    def handle_preexisting_token
        auth_cookie = cookies.signed[:auth]
        unless auth_cookie.nil?
            # Get the redirect to from the params.
            redirect = params[:redirect_to]
            redirect = '/' if redirect.nil?

            # Redirect to the redirect path.
            redirect_to redirect, status: :see_other
        end
    end
end
