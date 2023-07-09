class HomeController < ApplicationController
    def home; end

    def render_opportunity
        @opportunity = Opportunity.find_by_uuid!(params[:id])
        raise ActionController::RoutingError.new('Not Found') unless request.headers['Turbo-Frame'].present?
        render 'opportunity_frame'
    end
end
