#include <iostream>
#include <GLFW/glfw3.h>
#include <OpenGL/gl3.h> 
#include <OpenGL/glu.h>
#include <GLUT/glut.h> 
#include <glm/glm.hpp>
#include <vector>
#include<cmath>
#include <random>
#include <algorithm>
#include "parabola.hpp"
#include "grid.hpp"

using namespace std;
using namespace glm;

int revealIdx = 0;

bool playing = false;
double lastTime = 0.0;
double addInterval = 0.1;

vec3 b0 = vec3(-0.5, -0.6,0.0);
vec3 b1 = vec3(0.0, 0.9, 0.0);
vec3 b2 = vec3(0.6, -0.7, 0.0);

float T = 0.f;
float speed = 0.35f;
float t1 = 0.33f;
float t2 = 0.66f;

vector<float> Ts;
vector<vec3> pts;
vector<vec3> Parabola_pts;

vec3 lerp(const vec3 &a,const vec3&b,float s){ 
    vec3 pt = vec3(a.x+(b.x-a.x)*s, a.y+(b.y-a.y)*s, 0);
    return pt; 
}

void regen(int n){

    Ts.clear();
    pts.clear();
    pts.reserve(n); // 一次擴增 n 個

    mt19937 rng(random_device{}());
    uniform_real_distribution<float> U(0.f,1.f);
    for(int i=0;i<n;++i) Ts.push_back(U(rng));
    sort(Ts.begin(),Ts.end());
    pts.resize(n);
    for(int i=0;i<n;++i){
        float t=Ts[i], u=1.f-t;
        pts[i]=u*u*b0 + 2*u*t*b1 + t*t*b2;
    }
    revealIdx=0;
    T=0.f;
    lastTime=glfwGetTime();
}

    


void drawPoint(const vec3 &p,float size){
    glPointSize(size);
    glBegin(GL_POINTS);
    glVertex2f(p.x,p.y);
    glEnd();
}

void drawline(const vec3 & a, const vec3 & b){
    glLineWidth(2.0f);
    glBegin(GL_LINES);
    glVertex2f(a.x,a.y);
    glVertex2f(b.x,b.y);
    glEnd();
}

void drawParabola(){
        vec3 b01 = lerp(b0, b1, T);
        vec3 b12 = lerp(b1, b2, T);
        vec3 b02 = lerp(b01, b12, T);

        //Vec2 poly[3]={b0,b1,b2};
        //drawPolyline(poly,3,2.f);
        // 外圍多邊形跟 b0, b1, b2
        glColor3f(0.0f,1.0f,1.0f);
        drawPoint(b0,15.f);
        drawPoint(b1,15.f);
        drawPoint(b2,15.f);
        drawline(b0, b1);
        drawline(b1, b2);
        
        // 第一次插值的線
        glColor3f(0.2f,0.6f,0.95f);
        drawPoint(b01,8.f);
        drawPoint(b12,8.f);
        
        drawline(b01,b12);
        
        //第一個參數 t1 = 0.33f
        glColor3f(0.85f,0.85f,0.85f);
        glBegin(GL_POINTS);
        glPointSize(4.f);
        for (int i = 0; i < revealIdx; i++)
            glVertex2f(pts[i].x, pts[i].y);
            
        glEnd();

        drawPoint(b02,5.f);
}
void update(){
    double now = glfwGetTime();
    float dt = float(now - lastTime);
    lastTime = now;
    if(!playing) return;
    T += speed*dt;
    if(T > 1.f) T = 1.f;
    while( revealIdx < (int)Ts.size() && Ts[revealIdx] <= T) revealIdx++;
}


void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods){
    if(action != GLFW_PRESS) return;
    if(key == GLFW_KEY_SPACE) playing = !playing;
    if (key == GLFW_KEY_UP) speed *= 1.25;
    if (key == GLFW_KEY_DOWN) speed *= 0.75;
    if(key == GLFW_KEY_R) regen((int)pts.size()? (int)pts.size():2000);;
}



int main(){
    glfwInit();

    GLFWwindow* window = glfwCreateWindow(800, 600, "拋物線實作", NULL, NULL);
    glfwMakeContextCurrent(window);
    glfwSwapInterval(1);
    glEnable(GL_DEPTH_TEST);

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

    glfwSetKeyCallback(window, key_callback);

    regen(2000);
     while (!glfwWindowShouldClose(window)) {
        glfwPollEvents();
        
        int width, height;
        glfwGetFramebufferSize(window, &width, &height);
        update();
        glClearColor(0, 0, 0, 0);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        draw_grid(10);

        drawParabola();


        glfwSwapBuffers(window);
     }
     glfwTerminate();
     return 0;
}