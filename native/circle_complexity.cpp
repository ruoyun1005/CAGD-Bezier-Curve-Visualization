#include<iostream>
#include <vector> 
#include <chrono>
#include <cmath>
#include <string>

using namespace std;
using namespace chrono;


struct Vec2
{
    float x,y;
};

// ──────────────────────────────
// 用 bezier curve 畫近似圓
// ──────────────────────────────

inline Vec2 evalCubicBezier(const Vec2& P0, const Vec2& P1,const Vec2& P2, const Vec2& P3, float t){

    float u = 1.0f - t;
    float b0 = u*u*u;
    float b1 = 3*u*u*t;
    float b2 = 3*u*t*t;
    float b3 = t*t*t;
    return {
        b0*P0.x + b1*P1.x + b2*P2.x + b3*P3.x,
        b0*P0.y + b1*P1.y + b2*P2.y + b3*P3.y
    };
}

// k = 4*(sqrt(2)-1)/3 ≈ 0.5522847
constexpr float K = 0.552284749831f;
constexpr Vec2 CIRCLE_PTS[4][4] = {
    { {1,0}, {1,K}, {K,1}, {0,1} },       // 第一象限
    { {0,1}, {-K,1}, {-1,K}, {-1,0} },    // 第二象限
    { {-1,0}, {-1,-K}, {-K,-1}, {0,-1} }, // 第三象限
    { {0,-1}, {K,-1}, {1,-K}, {1,0} }     // 第四象限
};

inline Vec2 evalCircleByBezier(float u)
{
    float s = u * 4.0f;       // 分成 4 個區間
    int seg = (int)floor(s);
    if (seg >= 4) seg = 3;
    float t = s - seg;        // 區間內的 t ∈ [0,1)

    const auto& c =  CIRCLE_PTS[seg];
    return evalCubicBezier(c[0], c[1], c[2], c[3], t);
}
// ──────────────────────────────
// 用 sin/cos 參數方程畫單位圓
// ──────────────────────────────
float pi = 3.14159265358979323846f;

Vec2 evalCircleByTrig(float u)
{
    float theta = 2.0f * pi * u;
    
    return { cos(theta), sin(theta) };
}

// ──────────────────────────────
// Benchmark 設定
// ──────────────────────────────
vector<int> sampleCounts = { 100, 1000, 10000, 50000 };
vector<double> timeBezier;
vector<double> timeTrig;

volatile float g_sink_x = 0.0f;
volatile float g_sink_y = 0.0f;

void runBenchmark(){
    timeBezier.clear();
    timeTrig.clear();

    const int NUM_REPEAT = 20000;

    for (int N : sampleCounts) {
        // 預先產生所有 u，避免把亂數開銷算進去
        vector<float> us(N);
        for (int i = 0; i < N; ++i) {
            us[i] = (float)i / (float)N;
        }

        // 1) Bezier
        {
        auto t0 = high_resolution_clock::now(); // std::chrono::high_resolution_clock 高精度計時器
        for (int r = 0; r < NUM_REPEAT; ++r) {
                for (int i = 0; i < N; ++i) {
                    //(void)evalCircleByBezier(us[i]);
                    Vec2 p = evalCircleByBezier(us[i]);
                    g_sink_x += p.x;
                    g_sink_y += p.y;
                }
            }
            auto t1 = high_resolution_clock::now();
            duration<double, milli> ms = t1 - t0;
            timeBezier.push_back(ms.count());
        }

        // 2) sin cos
    {
        auto t0 = high_resolution_clock::now();
        for (int r = 0; r < NUM_REPEAT; ++r) {
                for (int i = 0; i < N; ++i) {
                    //(void)evalCircleByTrig(us[i]);
                    Vec2 p = evalCircleByTrig(us[i]);
                    g_sink_x += p.x;
                    g_sink_y += p.y;
                }
            }

            auto t1 = high_resolution_clock::now();
            duration<double, milli> ms = t1 - t0;
            timeTrig.push_back(ms.count());
    }
        
    }

}


int main()
{
    runBenchmark();

    // Output table
    cout << "==============================================\n";
    cout << "  Circle Evaluation Complexity Comparison\n";
    cout << "  (Bezier 4 cubic arcs vs sin/cos)\n";
    cout << "==============================================\n\n";
    cout << "Samples\tBezier(ms)\tTrig(ms)\n";
    cout << "----------------------------------------------\n";

    for (int i = 0; i < sampleCounts.size(); i++) {
        std::cout << sampleCounts[i] << "\t"
                  << timeBezier[i] << "\t\t"
                  << timeTrig[i]   << "\n";
    }
    cout << "\nDone.\n";
    return 0;
}