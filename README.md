# Jekyll-Image-Gallery
Static site template to display images with automatic filtering and tagging.

Built on top of [EZ Gallery](https://netfriend.neocities.org/ez-gallery/) and [GLightbox](https://github.com/biati-digital/glightbox).

# Key features:
* **Automatic thumbnail generation and integrated lightbox**: give users a high-level glance of your work with low-bandwidth images, with high-res versions a single click away.
* **Robust tagging and filtering system**: user-definable and hierarchical tags make it easy for users to find the works they want to see or for you to link users to a specific subset of your works.
* **All gallery information stored in a single file, which can be updated through a bundled python script**: no pesky copy and pasting of image locations and descriptions!
* **Direct link to individual images in gallery view**: avoid hotlinking raw images and preserve the bundled description for a given piece.

# Prerequisites

The following software must be installed:
* [Python](https://www.python.org/downloads/)
* [Jekyll](https://jekyllrb.com/docs/installation/)
* [ImageMagick](https://imagemagick.org/script/download.php)

> **Note for Windows users**: While it is possible to install all of these tools under windows, I highly recommend installing **[WSL](https://learn.microsoft.com/en-us/windows/wsl/install)** and running JIG there instead.

# Step 1: Get the demo online
Bundled with the gallery is a demo that you can use to make sure that Jekyll is set up properly. You can see an example of what the demo should look like [here](http://hamaonoverdrive.online/demo/gallery/).
1. Download the latest version of JIG from the [releases page](https://github.com/hamaonoverdrive/Jekyll-Image-Gallery/releases).
2. Create a new Jekyll site with
```
jekyll new mysitename
```
3. Extract the contents of the `JIGv*.zip` into the `mysitename` directory and overwrite the `index.markdown` file.
4. From inside the `mysitename` directory, run the following command to build and serve the webpage locally.
```
bundle exec jekyll serve
```
5. Open your web browser and navigate to [http://localhost:4000](http://localhost:4000).

#### Voila! The demo should be running on your local machine.

# Step 2: Populate the gallery with your own images
The gallery expects all images to be stored in `/imgs/gallery/` and stores a file with information about all of these at `_data/gallery.yml`. The script `generateGallery.py` can automatically update the yml file based on the contents of the image directory.
1. Delete all image files currently inside of `/imgs/gallery/`.
2. Copy your image files into `/imgs/gallery/`.
> JIG will try to sort images based on image names. The heading that each image is placed under is decided by the filename up to the first underscore (`_`). **All image filenames must have an underscore for the script to work.**
3. Edit `_data/gallery.yml` and remove everything under the `images` heading.
4. Remove the contents of the `tags` section and add your own tag structure.
  - You can have as many tag groups as you like, but remember that every gallery item will need to be tagged with at least one item from each root group.
  - Gallery items may be tagged with multiple tags from any group.
  - Hierarchical tags can only go 3 layers deep.
5. Inside the directory for your project, run `python generateGallery.py -i` and follow the prompts to describe and tag your images.
6. Run `bundle exec jekyll serve` and check your local browser to make sure that the gallery appears as expected.
7. To export the gallery to your website, run `bundle exec jekyll build` and copy the contents of the `_site` folder to your web host.

## Step 2.5: Update the gallery with more images
This project was designed to make this step as simple as possible after the initial setup.
1. Copy all new image files to `/imgs/gallery/`.
2. From the project directory, run `python generateGallery.py -i` and follow the prompts.
3. Run `bundle exec jekyll build` and copy the new contents of the `_site` folder to your web host.

# Step 3 (optional): Integrate the gallery with the rest of your Jekyll site
This step is a little involved because JIG leverages many features of Jekyll, all of which need to be integrated for the gallery to work.
1. Copy the following paths from JIG into your project directory:

```
/assets/*
/imgs/gallery/
/_includes/image.html
/_layouts/gallery.html
/_plugins/jekyll-responsive-magick.rb
```
If there are any collisions, they will have to be refactored.

2. Modify your `_layouts/default.html` file and include the following in your `<head>` tag:

```
{% raw %}{% if page.layout == 'gallery' %}
<link href="assets/glightbox.min.css" rel="stylesheet" type="text/css" />
<link href="assets/gallery.css" rel="stylesheet" type="text/css" />
<script src="assets/glightbox.min.js"></script>
<script src="assets/gallery.js"></script>
{% endif %}{% endraw %}
 ```
From here, go to step 2.2 to finish setting up the gallery.

# Step 4 (optional): Gallery configuration settings
#### How to specify image tags via URL
Example: [`?category=photograph&photograph=animal,mineral&warnings=no-warning-needed`](http://hamaonoverdrive.online/demo/gallery?category=photograph&photograph=animal,mineral&warnings=no-warning-needed)
- add a `?` to the end of the URL and list each tag group after that, separated by a `&`
- both tags and groups are lowercase and "slugified", ie all spaces are replaced with `-` and all punctuation is removed
- when specifying multiple tags in the same group, separate them with a comma
- when specifying a nested tag, all tags that are above it in the hierarchy must be defined as well

#### Default view
In `_data/gallery.yml`, the default groups on page load can be specified by adding a `default` group with tag groups inside it, formatted the same way that they are in the tags section. Items that do not have these tags will be hidden by default.

For example, the following will hide all items tagged with "arachnophobia" from the demo gallery:
```
default:
  Warnings:
    - No warning needed
```
#### Thumbnail size and quality
Some settings for how ImageMagick creates thumbnails can be defined in your `_config.yml` file. The default settings are as follows:
```
responsive:
  pixels: 22500  # approximate number of pixels in each thumbnail
  quality: 30    # image compression quality
```
