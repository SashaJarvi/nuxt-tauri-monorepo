// Verifies the Rust port matches natural over all AFINN words and sample texts.
use native_lib::analysis::{analyze, porter::stem};
use std::collections::HashMap;

#[test]
fn stems_match_natural() {
    let raw = include_str!("fixtures/stems.json");
    let expected: HashMap<String, String> = serde_json::from_str(raw).unwrap();
    let mut mismatches = Vec::new();
    for (word, want) in &expected {
        let got = stem(word);
        if &got != want {
            mismatches.push(format!("stem({word}) = {got}, want {want}"));
        }
    }
    assert!(mismatches.is_empty(), "{} mismatches:\n{}", mismatches.len(), mismatches.join("\n"));
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct Case {
    input: String,
    word_count: usize,
    char_count: usize,
    most_frequent_word: Option<String>,
    sentiment_score: Option<f64>,
}

#[test]
fn analysis_matches_natural() {
    let raw = include_str!("fixtures/analysis.json");
    let cases: Vec<Case> = serde_json::from_str(raw).unwrap();
    for c in &cases {
        let a = analyze(&c.input);
        assert_eq!(a.word_count, c.word_count, "wordCount {:?}", c.input);
        assert_eq!(a.char_count, c.char_count, "charCount {:?}", c.input);
        assert_eq!(a.most_frequent_word, c.most_frequent_word, "mostFrequentWord {:?}", c.input);
        match (a.sentiment_score, c.sentiment_score) {
            (None, None) => {}
            (Some(x), Some(y)) => assert!((x - y).abs() < 1e-12, "sentiment {:?}: {x} vs {y}", c.input),
            _ => panic!("sentiment None/Some mismatch for {:?}", c.input),
        }
    }
}
