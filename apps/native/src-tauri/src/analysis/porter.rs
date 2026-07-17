// Faithful port of natural@8.1.1 lib/natural/stemmers/porter_stemmer.js
use regex::Regex;
use std::sync::LazyLock;

static RE_CG1: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[^aeiouy]+y").unwrap());
static RE_CG2: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[aeiou]+").unwrap());
static RE_CG3: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[^V]+").unwrap());
static RE_CC1: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[^aeiouy]y").unwrap());
static RE_CC2: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[aeiou]").unwrap());
static RE_CC3: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[^V]").unwrap());
static RE_S1A: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"(ss|i)es$").unwrap());
static RE_EDING: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"(ed|ing)$").unwrap());
static RE_LSZ_END: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[^lsz]$").unwrap());
static RE_WXY_END: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[^wxy]$").unwrap());
static RE_WXY_DOT_END: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[^wxy].$").unwrap());
static RE_S4A: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$").unwrap()
});
static RE_S4B: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^(.+?)(s|t)(ion)$").unwrap());

fn categorize_groups(token: &str) -> String {
    let s = RE_CG1.replace_all(token, "CV");
    let s = RE_CG2.replace_all(&s, "V");
    RE_CG3.replace_all(&s, "C").into_owned()
}

fn categorize_chars(token: &str) -> String {
    let s = RE_CC1.replace_all(token, "CV");
    let s = RE_CC2.replace_all(&s, "V");
    RE_CC3.replace_all(&s, "C").into_owned()
}

fn measure(token: &str) -> f64 {
    if token.is_empty() {
        return -1.0;
    }
    let g = categorize_groups(token);
    let g = g.strip_prefix('C').unwrap_or(&g);
    let g = g.strip_suffix('V').unwrap_or(g);
    g.chars().count() as f64 / 2.0
}

fn ends_with_double_cons(token: &str) -> bool {
    let c: Vec<char> = token.chars().collect();
    let n = c.len();
    n >= 2 && c[n - 1] == c[n - 2] && !matches!(c[n - 1], 'a' | 'e' | 'i' | 'o' | 'u')
}

// Replace trailing literal `pattern` with `replacement`; None if token doesn't end with pattern.
fn attempt_replace_str(token: &str, pattern: &str, replacement: &str) -> Option<String> {
    token
        .strip_suffix(pattern)
        .map(|base| format!("{base}{replacement}"))
}

fn attempt_replace_patterns(
    token: &str,
    replacements: &[(&str, &str, &str)],
    measure_threshold: Option<f64>,
) -> String {
    let mut replacement = token.to_string();
    for (pat, repl1, repl2) in replacements {
        let cond = match measure_threshold {
            None => true,
            Some(t) => {
                let m = match attempt_replace_str(token, pat, repl1) {
                    Some(ref s) => measure(s),
                    None => -1.0,
                };
                m > t
            }
        };
        if cond {
            if let Some(r) = attempt_replace_str(&replacement, pat, repl2) {
                replacement = r;
            }
        }
    }
    replacement
}

fn replace_patterns(token: &str, replacements: &[(&str, &str, &str)], mt: Option<f64>) -> String {
    let r = attempt_replace_patterns(token, replacements, mt);
    if r.is_empty() {
        token.to_string()
    } else {
        r
    }
}

fn replace_regex(token: &str, re: &Regex, include_parts: &[usize], minimum_measure: f64) -> Option<String> {
    let mut result = String::new();
    if let Some(caps) = re.captures(token) {
        for &i in include_parts {
            if let Some(m) = caps.get(i) {
                result.push_str(m.as_str());
            }
        }
    }
    if measure(&result) > minimum_measure {
        Some(result)
    } else {
        None
    }
}

fn step1a(token: &str) -> String {
    if let Some(caps) = RE_S1A.captures(token) {
        let g1 = caps.get(1).unwrap().as_str();
        let base = &token[..caps.get(0).unwrap().start()];
        return format!("{base}{g1}");
    }
    let c: Vec<char> = token.chars().collect();
    let n = c.len();
    if n > 2 && c[n - 1] == 's' && c[n - 2] != 's' {
        return c[..n - 1].iter().collect();
    }
    token.to_string()
}

fn step1b_callback(token: &str) -> Option<String> {
    if !categorize_groups(token).contains('V') {
        return None;
    }
    let result = attempt_replace_patterns(
        token,
        &[("at", "", "ate"), ("bl", "", "ble"), ("iz", "", "ize")],
        None,
    );
    if result != token {
        return Some(result);
    }
    if ends_with_double_cons(token) && RE_LSZ_END.is_match(token) {
        let mut c: Vec<char> = token.chars().collect();
        c.pop();
        return Some(c.into_iter().collect());
    }
    if measure(token) == 1.0 {
        let cc = categorize_chars(token);
        let cv: Vec<char> = cc.chars().collect();
        let last3: String = if cv.len() >= 3 {
            cv[cv.len() - 3..].iter().collect()
        } else {
            cc.clone()
        };
        if last3 == "CVC" && RE_WXY_END.is_match(token) {
            return Some(format!("{token}e"));
        }
    }
    Some(token.to_string())
}

fn step1b(token: &str) -> String {
    if token.ends_with("eed") {
        let base = &token[..token.len() - 3];
        if measure(base) > 0.0 {
            return format!("{base}ee");
        }
        return token.to_string();
    }
    if let Some(caps) = RE_EDING.captures(token) {
        let stripped = &token[..caps.get(0).unwrap().start()];
        if let Some(res) = step1b_callback(stripped) {
            return res;
        }
        return token.to_string();
    }
    token.to_string()
}

fn step1c(token: &str) -> String {
    let cg: Vec<char> = categorize_groups(token).chars().collect();
    let prefix_has_v = !cg.is_empty() && cg[..cg.len() - 1].contains(&'V');
    if token.ends_with('y') && prefix_has_v {
        let mut c: Vec<char> = token.chars().collect();
        c.pop();
        c.push('i');
        return c.into_iter().collect();
    }
    token.to_string()
}

fn step2(token: &str) -> String {
    replace_patterns(
        token,
        &[
            ("ational", "", "ate"), ("tional", "", "tion"), ("enci", "", "ence"),
            ("anci", "", "ance"), ("izer", "", "ize"), ("abli", "", "able"),
            ("bli", "", "ble"), ("alli", "", "al"), ("entli", "", "ent"), ("eli", "", "e"),
            ("ousli", "", "ous"), ("ization", "", "ize"), ("ation", "", "ate"),
            ("ator", "", "ate"), ("alism", "", "al"), ("iveness", "", "ive"),
            ("fulness", "", "ful"), ("ousness", "", "ous"), ("aliti", "", "al"),
            ("iviti", "", "ive"), ("biliti", "", "ble"), ("logi", "", "log"),
        ],
        Some(0.0),
    )
}

fn step3(token: &str) -> String {
    replace_patterns(
        token,
        &[
            ("icate", "", "ic"), ("ative", "", ""), ("alize", "", "al"),
            ("iciti", "", "ic"), ("ical", "", "ic"), ("ful", "", ""), ("ness", "", ""),
        ],
        Some(0.0),
    )
}

fn step4(token: &str) -> String {
    if let Some(r) = replace_regex(token, &RE_S4A, &[1], 1.0) {
        return r;
    }
    if let Some(r) = replace_regex(token, &RE_S4B, &[1, 2], 1.0) {
        return r;
    }
    token.to_string()
}

fn step5a(token: &str) -> String {
    let stripped_e = token.strip_suffix('e').unwrap_or(token);
    let m = measure(stripped_e);
    let cc: Vec<char> = categorize_chars(token).chars().collect();
    let sub: String = if cc.len() >= 4 {
        cc[cc.len() - 4..cc.len() - 1].iter().collect()
    } else {
        cc[..cc.len().min(3)].iter().collect()
    };
    let cond2 = m == 1.0 && !(sub == "CVC" && RE_WXY_DOT_END.is_match(token));
    if m > 1.0 || cond2 {
        stripped_e.to_string()
    } else {
        token.to_string()
    }
}

fn step5b(token: &str) -> String {
    if measure(token) > 1.0 {
        if let Some(base) = token.strip_suffix("ll") {
            return format!("{base}l");
        }
    }
    token.to_string()
}

pub fn stem(token: &str) -> String {
    if token.chars().count() < 3 {
        return token.to_string();
    }
    let t = token.to_lowercase();
    step5b(&step5a(&step4(&step3(&step2(&step1c(&step1b(&step1a(&t))))))))
}

#[cfg(test)]
mod tests {
    use super::stem;

    // Expected values captured from natural@8.1.1 PorterStemmer.stem.
    const CASES: &[(&str, &str)] = &[
        ("caresses", "caress"), ("ponies", "poni"), ("ties", "ti"), ("caress", "caress"),
        ("cats", "cat"), ("feed", "feed"), ("agreed", "agre"), ("plastered", "plaster"),
        ("bled", "bled"), ("motoring", "motor"), ("sing", "sing"), ("conflated", "conflat"),
        ("troubled", "troubl"), ("sized", "size"), ("hopping", "hop"), ("tanned", "tan"),
        ("falling", "fall"), ("hissing", "hiss"), ("fizzed", "fizz"), ("failing", "fail"),
        ("filing", "file"), ("happy", "happi"), ("sky", "sky"), ("relational", "relat"),
        ("conditional", "condit"), ("rational", "ration"), ("digitizer", "digit"),
        ("conformabli", "conform"), ("radicalli", "radic"), ("differentli", "differ"),
        ("vileli", "vile"), ("analogousli", "analog"), ("vietnamization", "vietnam"),
        ("predication", "predic"), ("operator", "oper"), ("feudalism", "feudal"),
        ("decisiveness", "decis"), ("hopefulness", "hope"), ("callousness", "callous"),
        ("formaliti", "formal"), ("sensitiviti", "sensit"), ("triplicate", "triplic"),
        ("formative", "form"), ("formalize", "formal"), ("electriciti", "electr"),
        ("electrical", "electr"), ("hopeful", "hope"), ("goodness", "good"),
        ("revival", "reviv"), ("allowance", "allow"), ("inference", "infer"),
        ("airliner", "airlin"), ("gyroscopic", "gyroscop"), ("adjustable", "adjust"),
        ("defensible", "defens"), ("irritant", "irrit"), ("replacement", "replac"),
        ("adjustment", "adjust"), ("dependent", "depend"), ("adoption", "adopt"),
        ("communism", "commun"), ("activate", "activ"), ("angulariti", "angular"),
        ("homologous", "homolog"), ("effective", "effect"), ("bowdlerize", "bowdler"),
        ("probate", "probat"), ("rate", "rate"), ("cease", "ceas"), ("controll", "control"),
        ("roll", "roll"), ("abandoned", "abandon"), ("loving", "love"), ("loved", "love"),
        ("hates", "hate"), ("hated", "hate"), ("wonderful", "wonder"), ("terrible", "terribl"),
        ("it", "it"), ("a", "a"), ("no", "no"),
    ];

    #[test]
    fn matches_natural_porter_stemmer() {
        for (word, expected) in CASES {
            assert_eq!(&stem(word), expected, "stem({word})");
        }
    }
}
