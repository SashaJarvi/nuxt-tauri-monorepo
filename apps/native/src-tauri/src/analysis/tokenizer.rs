// Port of natural@8.1.1 WordTokenizer: split on /[^A-Za-zА-Яа-я0-9_]+/,
// discarding empty and single-space fragments.
fn is_word_char(c: char) -> bool {
    c.is_ascii_alphanumeric()
        || c == '_'
        || ('\u{0410}'..='\u{042F}').contains(&c) // А-Я
        || ('\u{0430}'..='\u{044F}').contains(&c) // а-я
}

pub fn tokenize(text: &str) -> Vec<String> {
    text.split(|c: char| !is_word_char(c))
        .filter(|s| !s.is_empty() && *s != " ")
        .map(|s| s.to_string())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::tokenize;

    #[test]
    fn matches_natural_wordtokenizer() {
        assert_eq!(tokenize("It's a test."), vec!["It", "s", "a", "test"]);
        assert_eq!(tokenize("e_f"), vec!["e_f"]);
        assert_eq!(tokenize("a1b2 c-d"), vec!["a1b2", "c", "d"]);
        assert_eq!(tokenize("café über naïve"), vec!["caf", "ber", "na", "ve"]);
        assert_eq!(tokenize("  multiple   spaces  "), vec!["multiple", "spaces"]);
        assert_eq!(tokenize("!!! ??? ..."), Vec::<String>::new());
    }
}
