#pragma once
#include <vector>
#include <glm/glm.hpp>

using namespace std;
using namespace glm;

vector<vec3> generateparabola(
    const vec3 & b0,
    const vec3 & b1,
    const vec3 & b2,
    int n
);