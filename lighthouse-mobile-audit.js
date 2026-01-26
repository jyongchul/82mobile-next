const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function runLighthouse() {
  // Mobile config with 3G throttling
  const config = {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance', 'accessibility'],
      throttling: {
        // Simulated 3G network
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        requestLatencyMs: 150 * 3.75,
        downloadThroughputKbps: 1.6 * 1024,
        uploadThroughputKbps: 750,
        cpuSlowdownMultiplier: 4
      },
      emulatedFormFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2
      }
    }
  };

  console.log('Launching Chrome...');
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
  };

  console.log('Running Lighthouse audit...');
  const runnerResult = await lighthouse('http://localhost:3000/en', options, config);

  // Extract key metrics
  const { lhr } = runnerResult;
  const metrics = {
    performanceScore: lhr.categories.performance.score * 100,
    accessibilityScore: lhr.categories.accessibility.score * 100,
    lcp: lhr.audits['largest-contentful-paint'].numericValue / 1000,
    fid: lhr.audits['max-potential-fid'].numericValue,
    cls: lhr.audits['cumulative-layout-shift'].numericValue,
    tti: lhr.audits['interactive'].numericValue / 1000,
    tbt: lhr.audits['total-blocking-time'].numericValue,
    fcp: lhr.audits['first-contentful-paint'].numericValue / 1000,
    si: lhr.audits['speed-index'].numericValue / 1000,
  };

  console.log('\n=== LIGHTHOUSE MOBILE AUDIT RESULTS (3G) ===\n');
  console.log(`Performance Score: ${metrics.performanceScore.toFixed(0)}/100`);
  console.log(`Accessibility Score: ${metrics.accessibilityScore.toFixed(0)}/100`);
  console.log('\nCore Web Vitals:');
  console.log(`  LCP: ${metrics.lcp.toFixed(2)}s ${metrics.lcp < 3 ? '✅' : '❌'} (target: <3s)`);
  console.log(`  FID: ${metrics.fid.toFixed(0)}ms ${metrics.fid < 100 ? '✅' : '❌'} (target: <100ms)`);
  console.log(`  CLS: ${metrics.cls.toFixed(3)} ${metrics.cls < 0.1 ? '✅' : '❌'} (target: <0.1)`);
  console.log('\nOther Metrics:');
  console.log(`  FCP: ${metrics.fcp.toFixed(2)}s`);
  console.log(`  TTI: ${metrics.tti.toFixed(2)}s`);
  console.log(`  TBT: ${metrics.tbt.toFixed(0)}ms`);
  console.log(`  Speed Index: ${metrics.si.toFixed(2)}s`);

  // Save detailed report
  fs.writeFileSync('lighthouse-report.json', JSON.stringify(runnerResult.lhr, null, 2));
  console.log('\nDetailed report saved to: lighthouse-report.json\n');

  await chrome.kill();

  return metrics;
}

runLighthouse()
  .then(metrics => {
    console.log('=== SUMMARY ===');
    if (metrics.lcp < 3 && metrics.performanceScore > 85) {
      console.log('✅ Phase 5 performance goals MET!');
      process.exit(0);
    } else {
      console.log('⚠️  Performance optimization needed:');
      if (metrics.lcp >= 3) console.log('  - LCP needs optimization (>3s)');
      if (metrics.performanceScore <= 85) console.log('  - Performance score needs improvement (<85)');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Lighthouse error:', error);
    process.exit(1);
  });
