import yaml
import os
import argparse
from collections import OrderedDict


def resolve_tags(new_im, group, tags):
    done = False
    while not done:
        print(f"Eligible tags for group {group}:")
        for i in range(len(tags)):
            if isinstance(tags[i], str):
                print(f"\t{i+1}. {tags[i]}")
            else:
                print(f"\t{i+1}. {list(tags[i].keys())[0]}")
        tag_ind = input("Selected tag id: ")
        if "," in tag_ind:
            tag_ind = tag_ind.split(",")
        else:
            tag_ind = [tag_ind]
        try:
            tag_ind_ind = 0
            while tag_ind_ind < len(tag_ind):
                if int(tag_ind[tag_ind_ind]) < len(tags) + 1:
                    tag_ind_ind += 1
                else:
                    print(f"Invalid tag index {tag_ind[tag_ind_ind]}")
            done = True
        except:
            print(f"Invalid tag indexes {tag_ind}")

    tag_ind = [int(t)-1 for t in tag_ind]
    this_tags = []
    for one_tag_ind in tag_ind:
        new_tag = tags[one_tag_ind]
        if isinstance(new_tag, str):
            this_tags.append(new_tag)
        else:
            new_group = list(new_tag.keys())[0]
            this_tags.append(new_group)
            new_im = resolve_tags(new_im, new_group, new_tag[new_group])

    new_im["tags"][group] = this_tags
    return new_im


def main(interactive=False):
    file_loc = "_data/gallery.yml"
    gallery_loc = "imgs/gallery/"
    with open(file_loc, "r") as file:
        data = yaml.safe_load(file)

    files = [entry.name for entry in os.scandir(gallery_loc) if entry.is_file()]
    files = sorted(files, reverse = True)

    if "images" not in data.keys():
        data["images"] = []
    current_imgs = []
    for year in data["images"].keys():
        current_imgs.extend([datum["path"] for datum in data["images"][year]["images"]])

    for file in files:
        if file not in current_imgs:
            new_im = {"path": file}
            year = int(file[0:4])
            if interactive:
                print(f"Found new image: {file}")
                title = input("Add title for image (enter for none): ")
                if title != "":
                    new_im["title"] = title
                desc = input("Add description for image (enter for none): ")
                if desc != "":
                    new_im["desc"] = desc
                new_im["tags"] = {}
                for group, tags in data["tags"].items():
                    new_im = resolve_tags(new_im, group, tags)
            if year not in data["images"].keys():
                data["images"][year] = {"images": []}
            data["images"][year]["images"].append(new_im)

    for year, vals in data["images"].items():
        vals["images"] = sorted(vals["images"], reverse=True, key=lambda y: y["path"])

    with open(file_loc, "w") as file:
        yaml.dump(data, file)

    return


if __name__ == "__main__":
    p = argparse.ArgumentParser(prog="GalleryGenerator", description="Updates the existing yml file for this site from the files in /imgs/gallery/")
    p.add_argument("-i", "--interactive", action="store_true")
    args = p.parse_args()
    main(args.interactive)
