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
