module Jekyll
  class NoticeBlock < Liquid::Block
    def initialize(tag_name, input, tokens)
      super
      @input = input
    end

    def render(context)
      text = super
      site = context.registers[:site]
      converter = site.find_converter_instance(::Jekyll::Converters::Markdown)

      input_split = split_params(@input)
      type = input_split[0].strip.downcase

      output = converter.convert(text)
      "<div class=\"notices #{type}\">#{output}</div>"
    end

    def split_params(params)
      params.split("|")
    end
  end
end

Liquid::Template.register_tag('notice', Jekyll::NoticeBlock)
