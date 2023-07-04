var debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}


// vanilla document onload
window.onload = () => {
  const inputElt = document.querySelector("#autocomplete")
  const clearButtonElt = document.querySelector("#clear-autocomplete")
  const sectionElts = document.querySelectorAll(".filterable-section")

  const filterableElts =
    Array
      .from(document.querySelectorAll("li.filterable"))
      .reduce((result, filterableElt) => {
        result[filterableElt.dataset.entityNom] = filterableElt
        return result
      }, {})

  const fuse = new Fuse(Object.keys(filterableElts), { shouldSort: false, threshold: 0.3, distance: 10 })

  const refreshUi = ({ queryPresent }) => {
    for (const sectionElt of sectionElts) {
      const shouldBeVisible = !!sectionElt.querySelector('li.filterable[data-visible="true"]')
      sectionElt.style.display = shouldBeVisible ? "" : "none"
    }
    clearButtonElt.toggleAttribute("disabled", !queryPresent)
  }

  const toggleDisplay = (elt, value) => {
    elt.style.display = (value ? "" : "none")
    elt.setAttribute("data-visible", value ? "true" : "false")
  }

  const refreshFilteredResults = (query) => {
    if (query.length === 0) {
      for (const filterableElt of Object.values(filterableElts)) {
        toggleDisplay(filterableElt, true)
      }
    } else {
      const matches = fuse.search(query).map(({ item }) => item)
      for (const [nom, filterableElt] of Object.entries(filterableElts)) {
        toggleDisplay(filterableElt, matches.includes(nom))
      }
    }
    refreshUi({ queryPresent: query.length > 0 })
  }

  inputElt.addEventListener(
    'input',
    debounce((event) => refreshFilteredResults(event.target.value), 50)
  );
  clearButtonElt.addEventListener('click', (e) => {
    e.preventDefault()
    inputElt.value = ""
    refreshFilteredResults("")
  })

  refreshFilteredResults(inputElt.value)
}
