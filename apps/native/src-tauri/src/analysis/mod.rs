pub mod tokenizer;
pub mod porter;
pub mod sentiment;

use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Analysis {
    pub word_count: usize,
    pub char_count: usize,
    pub most_frequent_word: Option<String>,
    pub sentiment_score: Option<f64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TextAnalysisResult {
    pub id: String,
    pub timestamp: String,
    pub analysis: Analysis,
}

use std::collections::HashMap;

// charCount matches JS String#length (UTF-16 code units).
fn char_count(text: &str) -> usize {
    text.encode_utf16().count()
}

// mostFrequentWord: lowercase, count, first-occurrence wins on ties, None if empty.
fn most_frequent_word(words: &[String]) -> Option<String> {
    if words.is_empty() {
        return None;
    }
    let mut counts: HashMap<String, usize> = HashMap::new();
    let mut order: Vec<String> = Vec::new();
    for w in words {
        let lw = w.to_lowercase();
        let entry = counts.entry(lw.clone()).or_insert(0);
        if *entry == 0 {
            order.push(lw);
        }
        *entry += 1;
    }
    let mut max_word: Option<String> = None;
    let mut max_count = 0usize;
    for w in &order {
        let c = counts[w];
        if c > max_count {
            max_count = c;
            max_word = Some(w.clone());
        }
    }
    max_word
}

pub fn analyze(text: &str) -> Analysis {
    let words = tokenizer::tokenize(text);
    Analysis {
        word_count: words.len(),
        char_count: char_count(text),
        most_frequent_word: most_frequent_word(&words),
        sentiment_score: sentiment::get_sentiment(&words),
    }
}

// Mirrors textAnalysisRequestSchema: 1..=10000 chars (JS String#length).
#[tauri::command]
pub fn analyze_text(text: String) -> Result<TextAnalysisResult, String> {
    let len = text.encode_utf16().count();
    if len < 1 {
        return Err("Text input cannot be empty".into());
    }
    if len > 10000 {
        return Err("Text input exceeds the maximum allowed length".into());
    }
    Ok(TextAnalysisResult {
        id: uuid::Uuid::new_v4().to_string(),
        timestamp: chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true),
        analysis: analyze(&text),
    })
}

#[cfg(test)]
mod tests {
    use super::{analyze, Analysis};

    fn approx_score(a: Option<f64>, b: Option<f64>) -> bool {
        match (a, b) {
            (None, None) => true,
            (Some(x), Some(y)) => (x - y).abs() < 1e-12,
            _ => false,
        }
    }

    fn check(text: &str, expected: Analysis) {
        let got = analyze(text);
        assert_eq!(got.word_count, expected.word_count, "wordCount for {text:?}");
        assert_eq!(got.char_count, expected.char_count, "charCount for {text:?}");
        assert_eq!(got.most_frequent_word, expected.most_frequent_word, "mostFrequentWord for {text:?}");
        assert!(approx_score(got.sentiment_score, expected.sentiment_score), "sentiment for {text:?}");
    }

    #[test]
    fn matches_natural_pipeline() {
        check(
            "I love love love this but I hate the bug",
            Analysis { word_count: 10, char_count: 40, most_frequent_word: Some("love".into()), sentiment_score: Some(0.3) },
        );
        check(
            "This is not good and not wonderful",
            Analysis { word_count: 7, char_count: 34, most_frequent_word: Some("not".into()), sentiment_score: Some(-1.0) },
        );
        check(
            "the the the cat cat dog",
            Analysis { word_count: 6, char_count: 23, most_frequent_word: Some("the".into()), sentiment_score: Some(0.0) },
        );
        check(
            "!!! ??? ...",
            Analysis { word_count: 0, char_count: 11, most_frequent_word: None, sentiment_score: None },
        );
        check(
            "café über naïve",
            Analysis { word_count: 4, char_count: 15, most_frequent_word: Some("caf".into()), sentiment_score: Some(0.0) },
        );
    }
}
