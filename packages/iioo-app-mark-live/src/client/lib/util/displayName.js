/**
 * @file displayName
 * @author Cuttle Cong
 * @date 2018/5/3
 * @description
 */

export default function displayName(component) {
  return (
    component.displayName ||
    component.name ||
    (
      component.type && ( component.type.displayName || component.type.name )
    ) || 'Unknown'
  )
}
