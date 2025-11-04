#pragma once
#include <vector>
#include <glm/glm.hpp>

using namespace std;
using namespace glm;

vector<vec3> generateBezierCurve(
    const vec3 & b0,
    const vec3 & b1,
    const vec3 & b2,
    const vec3 & b3,
    int n
);