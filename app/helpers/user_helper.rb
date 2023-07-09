module UserHelper
    def render_2fa_qr_code
        secret = ROTP::Base32.random_base32
        totp_url = ROTP::TOTP.new(secret).provisioning_uri(user.email)
        image = "data:image/png;base64,#{Base64.strict_encode64(RQRCode::QRCode.new(totp_url).as_png(size: 200).to_s)}"
        return "<input type='hidden' name='authenticator_secret' value='#{secret}' />
<div class='block w-full my-4'>
    <img src='#{image}' class='mx-auto' />
</div>".html_safe
    end
end
