module Jekyll
  class ImageBlock < Liquid::Block
    def initialize(tag_name, input, tokens)
      super
      @input = input
    end

    def render(context)
      text = super
      site = context.registers[:site]
      converter = site.find_converter_instance(::Jekyll::Converters::Markdown)

      input_split = split_params(@input)
      width = input_split[0].strip.downcase

      img = converter.convert(text)
      img = img.gsub("<p>", "")
      img = img.gsub("</p>", "").strip
      img = img.gsub("\n", "")

      src = img[/src=\"(.*)\"\salt=\"/,1]
      alt = img[/alt=\"(.*)\"/,1]

      # <img style="max-width: 100%; height: auto;"
      #      src="#{img}"
      #      width="#{width}">

      %(<div class="text-center">
        <figure class="img-thumbnail">
          <a href="#{src}">
            <img style="max-width: 100%; height: auto;"
                 src="#{src}" width="#{width}" />
            <figcaption>
              <small>#{alt}</small>
            </figcaption>
          </a>
        </figure>
      </div>)
    end

    def split_params(params)
      params.split("|")
    end
  end
end

Liquid::Template.register_tag('image', Jekyll::ImageBlock)
