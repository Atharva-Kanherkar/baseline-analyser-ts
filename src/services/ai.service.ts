import type { DetectedFeature, BaselineInfo, RiskAssessment, PRContext, AIAnalysis } from '../core/types.js';
import { logger } from '../utils/logger.js';

/**
 * Perplexity API response interfaces
 */
interface PerplexityChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: PerplexityChoice[];
}

/**
 * AI Service - Integrates Perplexity API for intelligent suggestions
 * 
 * This service enhances baseline analysis with AI-powered insights:
 * - Provides alternative solutions for compatibility issues
 * - Suggests polyfills and workarounds
 * - Recommends best practices
 * - Offers migration strategies
 */
export class AIService {
  private readonly API_BASE_URL = 'https://api.perplexity.ai/chat/completions';
  private readonly API_TIMEOUT = 30000; // 30 seconds for AI requests
  private readonly MODEL = 'sonar'; // Perplexity's web-search enabled model
  
  constructor(private apiKey?: string) {
    if (!apiKey) {
      logger.warn('Perplexity API key not provided. AI suggestions will be disabled.');
    }
  }

  /**
   * Analyzes features with AI to provide smart suggestions
   */
  async analyzeFeatures(
    risks: RiskAssessment[],
    prContext: PRContext
  ): Promise<AIAnalysis[]> {
    if (!this.apiKey) {
      logger.warn('AI analysis skipped: No API key provided');
      return [];
    }

    const analyses: AIAnalysis[] = [];
    
    // Focus on high and critical risk features first
    const prioritizedRisks = risks
      .filter(risk => ['HIGH', 'CRITICAL'].includes(risk.risk))
      .slice(0, 5); // Limit to 5 most critical issues

    for (const risk of prioritizedRisks) {
      try {
        const feature = risk.feature;
        const baseline = risk.baseline;
        
        if (feature) {
          const analysis = await this.analyzeFeature(feature, baseline, risk, prContext);
          if (analysis) {
            analyses.push(analysis);
          }
        }
      } catch (error) {
        logger.error(`Failed to analyze feature ${risk.feature.name}:`, error);
        // Continue with other features
      }
    }

    return analyses;
  }

  /**
   * Analyzes a single feature with AI
   */
  private async analyzeFeature(
    feature: DetectedFeature,
    baseline: BaselineInfo | null,
    risk: RiskAssessment,
    prContext: PRContext
  ): Promise<AIAnalysis | null> {
    const prompt = this.buildAnalysisPrompt(feature, baseline, risk, prContext);
    
    try {
      const response = await this.queryPerplexity(prompt);
      return this.parseAIResponse(response, feature, baseline, risk);
    } catch (error) {
      logger.error(`AI analysis failed for ${feature.name}:`, error);
      return null;
    }
  }

  /**
   * Builds a comprehensive prompt for AI analysis
   */
  private buildAnalysisPrompt(
    feature: DetectedFeature,
    baseline: BaselineInfo | null,
    risk: RiskAssessment,
    prContext: PRContext
  ): string {
    const targetBrowsers = prContext.repository.name.includes('mobile') 
      ? 'mobile browsers' 
      : 'modern browsers';

    return `
Analyze this web feature compatibility issue and provide actionable solutions:

FEATURE DETAILS:
- Feature: ${feature.name}
- Type: ${feature.type}
- File: ${feature.location.file}
- Line: ${feature.location.line}
- Code Snippet: ${feature.location.snippet}

COMPATIBILITY STATUS:
- Baseline Status: ${baseline?.status || 'Unknown'}
- Browser Support: ${baseline ? JSON.stringify(baseline.supportedBrowsers) : 'Unknown'}
- Risk Level: ${risk.risk}
- Risk Reason: ${risk.reason}

PROJECT CONTEXT:
- Project: ${prContext.repository.owner}/${prContext.repository.name}
- Target: ${targetBrowsers}
- PR Size: ${prContext.size}

Please provide:
1. A clear explanation of why this feature might cause compatibility issues
2. 3-5 specific, actionable solutions ranked by effectiveness:
   - Alternative approaches that work across browsers
   - Polyfills or workarounds if available  
   - Progressive enhancement strategies
   - Migration paths if needed
3. Code examples where applicable
4. Links to relevant documentation or resources
5. Assessment of implementation effort (low/medium/high)

Focus on practical, immediately actionable advice that a developer can implement.
Prioritize solutions that maintain functionality while ensuring broad browser support.

Format your response as JSON with this structure:
{
  "reasoning": "Brief explanation of the compatibility issue",
  "confidence": 0.8,
  "suggestions": [
    {
      "type": "alternative|workaround|polyfill|migration|best_practice",
      "title": "Brief title",
      "description": "Detailed explanation",
      "code": "Code example if applicable",
      "resources": ["URL1", "URL2"],
      "impact": "low|medium|high"
    }
  ]
}
`.trim();
  }

  /**
   * Queries Perplexity API
   */
  private async queryPerplexity(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

    try {
      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a web development expert specializing in browser compatibility and modern web standards. Provide practical, actionable advice with working code examples.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.1, // Lower temperature for more consistent, factual responses
          top_p: 0.9,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as PerplexityResponse;
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from Perplexity API');
      }

      return data.choices[0]?.message?.content || 'No content in response';
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Perplexity API request timed out');
      }
      
      throw error;
    }
  }

  /**
   * Parses AI response into structured analysis
   */
  private parseAIResponse(
    response: string,
    feature: DetectedFeature,
    baseline: BaselineInfo | null,
    risk: RiskAssessment
  ): AIAnalysis | null {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn(`No JSON found in AI response for ${feature.name}`);
        return this.createFallbackAnalysis(response, feature, baseline, risk);
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      return {
        feature: feature.name,
        baseline,
        risk,
        suggestions: parsedResponse.suggestions || [],
        reasoning: parsedResponse.reasoning || 'AI analysis completed',
        confidence: parsedResponse.confidence || 0.5,
      };
    } catch (error) {
      logger.warn(`Failed to parse AI response for ${feature.name}:`, error);
      return this.createFallbackAnalysis(response, feature, baseline, risk);
    }
  }

  /**
   * Creates a fallback analysis when JSON parsing fails
   */
  private createFallbackAnalysis(
    response: string,
    feature: DetectedFeature,
    baseline: BaselineInfo | null,
    risk: RiskAssessment
  ): AIAnalysis {
    return {
      feature: feature.name,
      baseline,
      risk,
      suggestions: [{
        type: 'best_practice' as const,
        title: 'Review AI Analysis',
        description: response.slice(0, 500) + (response.length > 500 ? '...' : ''),
        impact: 'medium' as const,
      }],
      reasoning: 'AI provided analysis in free-form text',
      confidence: 0.3,
    };
  }

  /**
   * Generates a summary of AI analyses for reporting
   */
  generateAISummary(analyses: AIAnalysis[]): string {
    if (analyses.length === 0) {
      return 'No AI analysis available for this PR.';
    }

    const totalSuggestions = analyses.reduce((sum, analysis) => sum + analysis.suggestions.length, 0);
    const avgConfidence = analyses.reduce((sum, analysis) => sum + analysis.confidence, 0) / analyses.length;
    
    const suggestionTypes = analyses
      .flatMap(a => a.suggestions)
      .reduce((acc, suggestion) => {
        acc[suggestion.type] = (acc[suggestion.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    let summary = `🤖 **AI Analysis Summary**\n\n`;
    summary += `- Analyzed ${analyses.length} high-risk features\n`;
    summary += `- Generated ${totalSuggestions} actionable suggestions\n`;
    summary += `- Average confidence: ${(avgConfidence * 100).toFixed(1)}%\n\n`;
    
    if (Object.keys(suggestionTypes).length > 0) {
      summary += `**Suggestion Types:**\n`;
      Object.entries(suggestionTypes)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          summary += `- ${type.replace('_', ' ')}: ${count}\n`;
        });
    }

    return summary;
  }
}
