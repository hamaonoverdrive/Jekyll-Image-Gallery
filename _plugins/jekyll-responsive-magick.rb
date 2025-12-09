require 'fileutils'

module Jekyll
  module ResponsiveFilter
    @@sizes = {}

    def identify(input)
      site = @context.registers[:site]
      if site.config['responsive']['verbose']
        verbose = site.config['responsive']['verbose']
      else
        verbose = false
      end
      cmd = "identify -ping -format '%w,%h' .#{input.shellescape}"
      if verbose
        print("#{cmd}\n")
      end
      @@sizes[input] = `#{cmd}`.split(',', 2).map!(&:to_i)
    end

    def width(input)
      if not input.is_a? String || input.length == 0 || input.chr != '/'
        throw "width: input must be absolute path"
      end
      if not @@sizes[input]
        identify(input)
      end
      return @@sizes[input][0]
    end

    def height(input)
      if not input.is_a? String || input.length == 0 || input.chr != '/'
        throw "height: input must be absolute path"
      end
      if not @@sizes[input]
        identify(input)
      end
      return @@sizes[input][1]
    end

    def textloc(input)
      width = width(input)
      height = height(input)
      if width / height > 1.7777
        return "bottom"
      else
        return "right"
      end
    end

    def getthumb(input)
      site = @context.registers[:site]
      if not input.is_a? String || input.length == 0 || input.chr != '/'
        throw "srcset: input must be absolute path"
      end
      dirname = File.dirname(input)
      basename = File.basename(input, '.*')
      extname = File.extname(input)
      src = ".#{dirname}/#{basename}#{extname}"

      if File.exist?(src) and ['.jpg', '.jpeg', '.png', '.gif'].include?(extname)
        dest = site.dest
        if site.config['responsive']['pixels']
          pixels = site.config['responsive']['pixels']
        else
          pixels = 10000
        end
        if site.config['responsive']['quality']
          quality = site.config['responsive']['quality']
        else
          quality = 80
        end
        if site.config['responsive']['verbose']
          verbose = site.config['responsive']['verbose']
        else
          verbose = false
        end
        
        file = "#{basename}-smol#{extname}"
        dst = "_responsive#{dirname}/#{file}"
        if not site.static_files.find{|file| file.path == dst}
          site.static_files << StaticFile.new(site, "_responsive", dirname, file)
          if not File.exist?(dst) or File.mtime(src) > File.mtime(dst)
            FileUtils.mkdir_p(File.dirname(dst))
            cmd = "convert #{src.shellescape} -strip -quality #{quality} -coalesce -resize #{pixels}@ #{dst.shellescape}"
            if verbose
              print("#{cmd}\n")
            end
            system(cmd)
          end
          return "#{dirname}/#{file}"
        end
      end
    end
  end  
end

Liquid::Template.register_filter(Jekyll::ResponsiveFilter)
