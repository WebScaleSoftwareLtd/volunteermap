class MarkdownUtil
    @@renderer = Redcarpet::Markdown.new(
        Redcarpet::Render::HTML.new(
            autolink: true, tables: true, safe_links_only: true,
            link_attributes: { target: "_blank", rel: "nofollow" }, filter_html: true,
        )
    )

    def self.render(text)
        @@renderer.render(text)
    end
end
