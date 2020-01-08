// Breakpoints

let breakpointIndicatorString, xl, lg, nav, md, sm, xs;

let Breakpoints = {xl,lg,nav,md,sm,xs};

function updateBreakpoints() {
  // Check breakpoint indicator in DOM ( :after { content } is controlled by CSS media queries )
  breakpointIndicatorString = window.getComputedStyle( document.querySelector('#breakpoint-indicator'), ':after' ).getPropertyValue('content').replace(/['"]+/g, '');

  Breakpoints['xl'] = breakpointIndicatorString === 'xl';
  Breakpoints['nav'] = breakpointIndicatorString === 'nav' || Breakpoints['xl'];
  Breakpoints['lg'] = breakpointIndicatorString === 'lg' || Breakpoints['nav'];
  Breakpoints['md'] = breakpointIndicatorString === 'md' || Breakpoints['lg'];
  Breakpoints['sm'] = breakpointIndicatorString === 'sm' || Breakpoints['md'];
  Breakpoints['xs'] = breakpointIndicatorString === 'xs' || Breakpoints['sm'];
}
// Update on page load
updateBreakpoints();
// Update on window.resize
window.addEventListener('resize', updateBreakpoints);

export default Breakpoints
