module ApplicationHelper
    def check_if_set(id)
        return "id=\"#{id}\"".html_safe unless params[id].present?
        "id=\"#{id}\" checked".html_safe
    end
end
