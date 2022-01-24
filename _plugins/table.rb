module Jekyll
  class TableBlock < Liquid::Block
    def initialize(tag_name, input, tokens)
      super
      @input = input
    end

    def render(context)
      text = super
      site = context.registers[:site]
      converter = site.find_converter_instance(::Jekyll::Converters::Markdown)

      output = converter.convert(text)
      output = output.gsub(
        "<table>",
        "<table class=\"table table-striped\">"
      )

      "<div class=\"table-responsive\">#{output}</div>"
    end
  end
end

Liquid::Template.register_tag('table', Jekyll::TableBlock)
