import { cloneRoute, cloneElement } from "../cloneElements"
import { DevTools } from "../devtools"
import { readFile } from "../util/helperFunctions"

window.addEventListener("message", async event => {
  if (
    event?.data?.payload?.event == "inspectedElement" &&
    event?.data?.payload?.payload?.value?.source &&
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__
  ) {
    const id = event.data.payload.payload.id
    const {
      columnNumber,
      fileName,
      lineNumber,
    } = event?.data?.payload?.payload?.value?.source
    const devTools = new DevTools(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)
    const ownerList = devTools.getOwnersList(id)

    const code = await readFile(fileName).catch(err => {
      throw new Error(err)
    })

    if (ownerList && columnNumber && fileName && lineNumber && code) {
      console.log(ownerList, columnNumber, fileName, lineNumber, event)

      if (ownerList[ownerList.length - 1].displayName === "Route") {
        cloneRoute(code, { columnNumber, lineNumber, fileName })
      } else if (
        ownerList[ownerList.length - 1].displayName === "IonTabButton"
      ) {
        // TODO Somehow obtain source from Route at which IonTabButton points, then clone
        const href = event?.data?.payload?.payload?.value?.props?.data?.href
        console.log(href)
        window.location.pathname = href
        const something = event?.data?.payload?.payload?.value?.id
        console.log(something)
        devTools.inspectElementDevId(something)
      } else {
        cloneElement(code, { columnNumber, lineNumber, fileName })
      }
    }
  }
})
