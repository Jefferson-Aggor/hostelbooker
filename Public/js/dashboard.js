// DOM elements
const roomType = document.getElementById("room-type");
const price = document.getElementById("price");
const description = document.getElementById("description");
const insideBathroom = document.getElementById("insideBathroom");
const kitchen = document.getElementById("kitchen");
const ac = document.getElementById("ac");
const porch = document.getElementById("porch");
const wardrobe = document.getElementById("wardrobe");
const monoBeds = document.getElementById("mono-beds");
const mainImage = document.getElementById("main-image");
const photo_1 = document.getElementById("photo-1");
const photo_2 = document.getElementById("photo-2");
const photo_3 = document.getElementById("photo-3");
const photo_4 = document.getElementById("photo-4");
const previewBtn = document.getElementById("view-preview");
const hidePreviewBtn = document.getElementById("hide-preview");
const previewAddRooms = document.getElementById("preview-add-rooms");

// placeholders
const roomTypePlaceholder = document.getElementById("room-type-placeholder");
const mainImagePlaceholder = document.getElementById("main-image-placeholder");
const photo_1_placeholder = document.getElementById("photo-1-placeholder");
const photo_2_placeholder = document.getElementById("photo-2-placeholder");
const photo_3_placeholder = document.getElementById("photo-3-placeholder");
const photo_4_placeholder = document.getElementById("photo-4-placeholder");

const pricePlaceholder = document.getElementById("price-placeholder");
// will call the accessories here later
const insideBathroomPlaceholder = document.getElementById(
  "insideBathroom-placeholder"
);
const descriptionPlaceholder = document.getElementById(
  "description-placeholder"
);
const kitchenPlaceholder = document.getElementById("kitchen-placeholder");
const acPlaceholder = document.getElementById("ac-placeholder");
const porchPlaceholder = document.getElementById("porch-placeholder");
const wardrobePlaceholder = document.getElementById("wardrobe-placeholder");
const monoBedsPlaceholder = document.getElementById("mono-beds-placeholder");

previewAddRooms.style.display = "none";
previewBtn.addEventListener("click", function (e) {
  e.preventDefault();
  previewAddRooms.style.display = "block";
});

hidePreviewBtn.addEventListener("click", function (e) {
  e.preventDefault();
  previewAddRooms.style.display = "none";
});

roomType.addEventListener("change", function (e) {
  e.preventDefault();
  const content = e.target.value;
  roomTypePlaceholder.innerHTML = " " + content;
  console.log(content);
});

const texts = function (parent, placeholder) {
  return parent.addEventListener("keyup", function (e) {
    const val = parent.value;
    placeholder.innerHTML = val;
  });
};

const checker = function (parent, placeholder) {
  return parent.addEventListener("click", function (e) {
    if (parent.checked === true) {
      placeholder.checked = true;
    } else {
      placeholder.checked = false;
    }
  });
};

const imageReplacer = function (parent, placeholder) {
  return parent.addEventListener("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    if (file !== undefined) {
      reader.onload = function (e) {
        placeholder.innerHTML = `<a href='${e.target.result}' data-lightbox="previewImages"><img
            src=${e.target.result}
            alt="${file.name}"
          /></a>`;
      };
      reader.readAsDataURL(file);
    } else {
      placeholder.innerHTML = "";
    }
  });
};

imageReplacer(mainImage, document.querySelector(".main-image"));
imageReplacer(photo_1, photo_1_placeholder);
imageReplacer(photo_2, photo_2_placeholder);
imageReplacer(photo_3, photo_3_placeholder);
imageReplacer(photo_4, photo_4_placeholder);

checker(insideBathroom, insideBathroomPlaceholder);
checker(kitchen, kitchenPlaceholder);
checker(ac, acPlaceholder);
checker(porch, porchPlaceholder);
checker(monoBeds, monoBedsPlaceholder);
checker(wardrobe, wardrobePlaceholder);

texts(price, pricePlaceholder);
texts(description, descriptionPlaceholder);
