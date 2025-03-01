import { treemaps } from "./treemap.js";

document.getElementById("submit_button").addEventListener("click", function () {
  const inputText = document.getElementById("wordbox").value;
  const processed = inputText.toLowerCase().replace(/[^a-z.,!?:;]/g, "");

  console.log("processed text:", processed); // check what text looks like after processing

  d3.select("#sankey_svg").selectAll("*").remove();
  d3.select("#flow_label").text("Character flow for ...");

  const Mymap = makeMap(processed);
  // console.log( Mymap);

  const treemapData = treemaps(Mymap);
  // console.log( treemapData);
});

function makeMap(text) {
  const vowels = "aeiouy";
  const consonants = "bcdfghjklmnpqrstvwxyz";
  const punctuation = ".,!?:;";
  const Mymap = {};

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (!Mymap[char]) {
      Mymap[char] = {
        char: char,
        count: 0,
        type: vowels.includes(char)
          ? "vowel"
          : consonants.includes(char)
          ? "consonant"
          : "punctuation",
        intransition: {},
        outtransition: {},
      };
    }

    Mymap[char].count++;
  }

  // going through the text second time for populating in and out transition
  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (i > 0) {
      const prevChar = text[i - 1];
      if (!Mymap[char].intransition[prevChar]) {
        Mymap[char].intransition[prevChar] = {
          charObj: Mymap[prevChar],
          count: 0,
        };
      }
      Mymap[char].intransition[prevChar].count++;
    }

    if (i < text.length - 1) {
      const nextChar = text[i + 1];
      if (!Mymap[char].outtransition[nextChar]) {
        Mymap[char].outtransition[nextChar] = {
          charObj: Mymap[nextChar],
          count: 0,
        };
      }
      Mymap[char].outtransition[nextChar].count++;
    }
  }

  return Mymap;
}
