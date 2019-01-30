/********************/
/* Helper functions */
/********************/

const containsAny = (str, substrings) => {
  for (var i = 0; i !== substrings.length; i++) {
     var substring = substrings[i];
     if (str.indexOf(substring) !== - 1) {
       return true;
     }
  }
  return false;
}


export default containsAny;
