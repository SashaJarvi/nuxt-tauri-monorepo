// Port of natural@8.1.1 SentimentAnalyzer("English", PorterStemmer, "afinn").getSentiment.
use crate::analysis::porter::stem;
use std::collections::HashMap;
use std::sync::LazyLock;

const AFINN_RAW: &str = include_str!("afinn165.json");
const NEGATIONS: [&str; 4] = ["not", "no", "never", "neither"];

// Vocabulary keyed by the stemmed AFINN word; on stem collision the later entry
// wins, matching natural's insertion-order construction.
static STEMMED_VOCAB: LazyLock<HashMap<String, i64>> = LazyLock::new(|| {
    let entries: Vec<(String, i64)> =
        serde_json::from_str(AFINN_RAW).expect("afinn165.json must be a [[word, valence], ...] array");
    let mut vocab: HashMap<String, i64> = HashMap::with_capacity(entries.len());
    for (word, valence) in entries {
        vocab.insert(stem(&word), valence);
    }
    vocab
});

pub fn get_sentiment(words: &[String]) -> Option<f64> {
    if words.is_empty() {
        return None; // 0 / 0 == NaN in JS, serialized to null
    }
    let vocab = &*STEMMED_VOCAB;
    let mut score: i64 = 0;
    let mut negator: i64 = 1;
    for token in words {
        let lower = token.to_lowercase();
        if NEGATIONS.contains(&lower.as_str()) {
            negator = -1; // never resets, matching natural
        } else if let Some(v) = vocab.get(&lower) {
            score += negator * v;
        } else if let Some(v) = vocab.get(&stem(&lower)) {
            score += negator * v;
        }
    }
    Some(score as f64 / words.len() as f64)
}

#[cfg(test)]
mod tests {
    use super::get_sentiment;

    fn words(list: &[&str]) -> Vec<String> {
        list.iter().map(|s| s.to_string()).collect()
    }

    fn approx(a: Option<f64>, b: Option<f64>) -> bool {
        match (a, b) {
            (None, None) => true,
            (Some(x), Some(y)) => (x - y).abs() < 1e-12,
            _ => false,
        }
    }

    #[test]
    fn matches_natural_get_sentiment() {
        // "wonderful amazing great fantastic excellent" -> 3.6
        assert!(approx(
            get_sentiment(&words(&["wonderful", "amazing", "great", "fantastic", "excellent"])),
            Some(3.6)
        ));
        // "I love love love this but I hate the bug" -> 0.3
        assert!(approx(
            get_sentiment(&words(&["I", "love", "love", "love", "this", "but", "I", "hate", "the", "bug"])),
            Some(0.3)
        ));
        // Non-resetting negator: "This is not good and not wonderful" -> -1
        assert!(approx(
            get_sentiment(&words(&["This", "is", "not", "good", "and", "not", "wonderful"])),
            Some(-1.0)
        ));
        // No hits -> 0
        assert!(approx(get_sentiment(&words(&["the", "the", "the", "cat", "cat", "dog"])), Some(0.0)));
        // Empty -> None (natural: 0/0 = NaN -> null)
        assert!(approx(get_sentiment(&[]), None));
    }
}
