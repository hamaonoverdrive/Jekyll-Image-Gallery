
function toggleSubfilters(id_name) {
  var target = document.getElementById(id_name);
  var icon = document.getElementById("ic-" + id_name);
  var table = document.getElementById("tb-" + id_name);
  if (target.style.display === "block") {
    target.style.display = "none";
    icon.classList.add("carrot-right");
    icon.classList.remove("carrot-left");
    table.classList.remove("bordered");
  } else {
    target.style.display = "block";
    icon.classList.remove("carrot-right");
    icon.classList.add("carrot-left");
    table.classList.add("bordered");
  }
}

function setArtVis(group_dict){
  /* going to assume that this is invoked on page load
   * when everything is visible.
   * also makes the assumption that a subsubgroup is
   * only specified if the subgroup containing it is specified 
    * */
  for (group in group_dict) {
    if (!root_groups.includes(group)) {
      toggleSubfilters(group);
    }
    for (tag of groups[group]) {
      if (!group_dict[group].includes(tag)){
        document.getElementById("ch-"+tag).checked = false;
        toggleArtVis(tag);
      }
    }
  }
}

function toggleArtVis(id_name){
  let group = "";
  for(var key in groups){
    if(groups[key].includes(id_name)){
      group = key;
    }
  }

  let loc_required = []; /* for an item to be displayed, it must have one of these classes */
  for(var item of groups[group]){
    if (document.getElementById("ch-"+item).checked) {
      loc_required.push(item);
    }
  }
  required[group] = loc_required;

  let added = document.getElementById("ch-"+id_name).checked;
  let items = document.getElementsByClassName("gallery-item");

  /* if this tag has children, hide/show the sub-items for them */
  if (id_name in groups){
    if (added){
      /* check and see if this was open or closed before changing visiblities */
      let icon = document.getElementById("ic-" + id_name);
      icon.style.display = "inline";
      if (icon.classList.contains("fa-angles-left")) {
        document.getElementById(id_name).style.display = "block";
        document.getElementById("tb-" + id_name).classList.add("bordered");
      }
      /* because of how we select things, have all children be 
       * on by default when a grouping is un-re-selected.
       */
      required[id_name] = groups[id_name].slice(0);
      for (child of document.getElementById(id_name).childNodes) {
        if (child.type === "checkbox") {
          child.checked = true;
        }
      }
      for (tag of groups[id_name]) {
        if (tag in groups) {
          for (child of document.getElementById(tag).childNodes) {
            if (child.type === "checkbox") {
              child.checked = true;
            }
          }
        }
      }
    } else {
      /* otherwise, if we're removing a group, delete all the children */
      document.getElementById(id_name).style.display = "none";
      document.getElementById("ic-" + id_name).style.display = "none";
      document.getElementById("tb-" + id_name).classList.remove("bordered");
      /*
      for (tag of groups[id_name]) {
        if (tag in groups && tag in required) {
          required[tag] = groups[tag];
        }
      }
      */
      required[id_name] = [];
    }
  }

  let new_elems = [];
  for (let i=0; i<items.length; i++) {
    let item = items[i];
    let classes = item.className.split(" ");
    let add_check = {};
    if (root_groups.includes(group) || classes.includes(group)) {
      /* only care about updating if this is in a group that had membership changed */
      let to_remove = true;
      for (let cl of classes) {
        if (added) {
          /* check to see if we need to make something visible */
          for (let required_group in required) {
            if (required[required_group].includes(cl)) {
              add_check[required_group] = cl;
            }
          }
        } else {
          if (required[group].includes(cl)) {
            to_remove = false;
          }
        }
      }
      if (added) {
        let to_add = true;
        for (var gr1 of root_groups) {
          if (!(gr1 in add_check)) {
            to_add = false;
            break;
          }
          if (add_check[gr1] in groups) {
            if (!(add_check[gr1] in add_check)) {
              to_add = false;
              break;
            }
            gr2 = add_check[add_check[gr1]]
            if (gr2 in groups) {
              if (!(gr2 in add_check)) {
                to_add = false;
                break;
              }
            }
          }
        }
        if (to_add) {
          console.log("passed")
          item.style.display = "inline";
        }
      }
      if (!added && to_remove) {
        item.style.display = "none";
      }
    }
    /* when all is said and done, if this is visible we need to throw it in the lightbox */
    if (item.style.display != "none"){
      new_elems.push(og_elems[i]);
    }
  }
  lightbox.setElements(new_elems);
}

