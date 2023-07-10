var debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}

window.onload = () => {
  const inputElt = document.querySelector("#autocomplete")
  const clearButtonElt = document.querySelector("#clear-autocomplete")
  const sectionElts = document.querySelectorAll(".filterable-section")

  const filterableEltsByNom =
    Array
      .from(document.querySelectorAll("li.filterable"))
      .reduce((result, filterableElt) => {
        const nom = filterableElt.dataset.entityNom
        if (!result[nom]) result[nom] = []

        result[nom].push(filterableElt)
        return result
      }, {})

  const fuse = new Fuse(Object.keys(filterableEltsByNom), { shouldSort: false, threshold: 0.3, distance: 100 })

  const refreshUi = ({ queryPresent }) => {
    for (const sectionElt of sectionElts) {
      const shouldBeVisible = !!sectionElt.querySelector('li.filterable[data-visible="true"]')
      sectionElt.style.display = shouldBeVisible ? "" : "none"
    }
    clearButtonElt.toggleAttribute("disabled", !queryPresent)
  }

  const toggleDisplayElt = (elt, value) => {
    elt.style.display = (value ? "" : "none")
    elt.setAttribute("data-visible", value ? "true" : "false")
  }

  const toggleDisplayElts = (elts, value) => elts.forEach(elt => toggleDisplayElt(elt, value))

  const refreshFilteredResults = (query) => {
    if (query.length === 0) {
      for (const filterableElts of Object.values(filterableEltsByNom)) {
        toggleDisplayElts(filterableElts, true)
      }
    } else {
      const matches = fuse.search(query).map(({ item }) => item)
      for (const [nom, filterableElts] of Object.entries(filterableEltsByNom)) {
        toggleDisplayElts(filterableElts, matches.includes(nom))
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
