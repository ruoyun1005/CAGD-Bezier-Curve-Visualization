#include <iostream>
#include <glm/glm.hpp>
#include <vector>
#include "bezier.hpp"

using namespace std;
using namespace glm;

vector<vec3> generateBezierCurve(const vec3 & b0,const vec3 & b1,const vec3 & b2,const vec3 & b3, int n){

    vector<vec3> pt;
    pt.reserve(n); // 一次擴增 n 個

    for(int i = 0; i <= n; i++){
        float t = static_cast<float>(rand()) / RAND_MAX;
        float u = 1.0 - t;

         // pt = u*u*b0 + 2*t*u*b1 + t*t;
    }

}